output "backend_public_ip" {
  description = "Public IP of the Backend EC2 instance"
  value       = aws_instance.backend.public_ip
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution (Frontend URL)"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "ecr_repository_url" {
  description = "The URL of the ECR repository"
  value       = aws_ecr_repository.backend.repository_url
}
