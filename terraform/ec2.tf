# ECR Repository (Free tier allows 500MB/mo)
resource "aws_ecr_repository" "backend" {
  name                 = "orderdigital-v2-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

# IAM Role for EC2 to pull from ECR
resource "aws_iam_role" "ec2_role" {
  name = "orderdigital-v2-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_readonly" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "orderdigital-v2-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# AMI: Amazon Linux 2023
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-arm64"]
  }
}

# EC2 Instance (Free Tier: t2.micro or t4g.micro)
resource "aws_instance" "backend" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t4g.micro"
  
  subnet_id                   = module.vpc.public_subnets[0]
  vpc_security_group_ids      = [aws_security_group.ec2_sg.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              dnf update -y
              dnf install -y docker
              systemctl enable docker
              systemctl start docker
              usermod -aG docker ec2-user
              
              # Pull image and run
              # En un entorno real de CI/CD, usariamos GitHub Actions para conectarnos via SSH y hacer deploy.
              # Aqui dejamos Docker listo.
              EOF

  tags = {
    Name = "orderdigital-v2-backend"
  }
}


resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
