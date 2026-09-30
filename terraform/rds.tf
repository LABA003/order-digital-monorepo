resource "aws_db_subnet_group" "default" {
  name       = "orderdigital-v2-rds-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_db_instance" "mysql" {
  identifier           = "orderdigital-v2-db-${var.environment}"
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = "db.t4g.micro" # Free tier eligible
  allocated_storage    = 20
  storage_type         = "gp2" # Free tier uses gp2
  
  db_name              = "menu_db"
  username             = var.db_username
  password             = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.default.name
  
  multi_az               = false
  publicly_accessible    = false
  skip_final_snapshot    = true
}

