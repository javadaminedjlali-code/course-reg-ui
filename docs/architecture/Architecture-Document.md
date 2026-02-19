# Architecture / Technical Design Document

## 1. Overview and Purpose
This application is an Online Course Registration System that allows students to search for courses and register for sessions while allowing instructors and authorized users to view schedules and session enrollment lists. This document defines the cloud infrastructure, application components, database design, networking, and security that will be used as the blueprint for building and testing the system during upcoming sprints.

## 2. Cloud Service Provider Selection and Justification
Amazon Web Services (AWS) was selected as the cloud service provider because it offers cost-effective, pay-as-you-go pricing, strong scalability options, and high availability through multi–Availability Zone designs. AWS also provides managed services (such as RDS and Load Balancing) that reduce operational overhead while meeting performance and security requirements.

## 3. AWS Services Used
The architecture will use AWS VPC, subnets, route tables, and an Internet Gateway to create a secure network boundary, plus an Application Load Balancer to distribute traffic across multiple application servers. The system will run on EC2 with an Auto Scaling Group for resiliency, store static assets in S3, host the database in RDS MySQL, and use IAM and Security Groups for access control along with CloudWatch for monitoring and logging.

| Category | AWS Service | Purpose in our system |
|---|---|---|
| Networking | VPC | Private network boundary for all resources |
| Networking | Public Subnets (2 AZs) | Hosts internet-facing components like the load balancer |
| Networking | Private App Subnets (2 AZs) | Hosts application servers (not directly internet-accessible) |
| Networking | Private DB Subnets (2 AZs) | Hosts the database tier (isolated) |
| Networking | Internet Gateway (IGW) | Allows public subnets to reach the internet |
| Networking (optional) | NAT Gateway | Allows private subnets to reach the internet for updates without being public |
| Traffic | Application Load Balancer (ALB) | Distributes traffic to healthy EC2 instances |
| Compute | EC2 | Runs the Node/Express API |
| Scaling | Auto Scaling Group (ASG) | Maintains multiple app servers across AZs for resiliency |
| Database | RDS (MySQL) | Managed MySQL database for application data |
| Storage | S3 | Stores static assets (images, exports, uploads) |
| Security | IAM | Controls permissions to AWS resources |
| Security | Security Groups | Firewall rules for ALB/EC2/RDS traffic |
| Monitoring | CloudWatch | Logs, metrics, and alarms for troubleshooting and performance |
| Configuration | SSM Parameter Store (or Secrets Manager) | Stores DB credentials and app config securely |


## 4. Application Design
The application will be built in JavaScript using the Node.js runtime with Express as the middleware, and it will expose a RESTful API that sends and receives JSON. The user interface will be implemented using React (or another chosen framework) and will interact with API endpoints for course search, registration, instructor schedules, and session enrollment management.

- Programming Language: JavaScript
- Runtime Environment: Node.js (LTS)
- Middleware: Express
- API Style: RESTful API (JSON)
- Front-End Framework: React (or Angular / None)
- Application Port: 3000 (example)

- Example Endpoints:
- GET /api/courses?dept=CS
- GET /api/courses/:courseId
- GET /api/sessions?courseId=:courseId
- POST /api/enrollments
- DELETE /api/enrollments/:enrollmentId
- GET /api/instructors/:instructorId/schedule
- GET /api/sessions/:sessionId/enrollments



## 5. Operating System and Virtual Server Configuration
The virtual servers will run Linux (Amazon Linux 2023 or Ubuntu LTS) because it is stable, widely supported on AWS, and well-suited for hosting Node.js applications with efficient resource usage. The application tier will use EC2 instances (e.g., t3.small with 2 vCPU/2 GB RAM and ~20–30 GB gp3 storage) behind an Auto Scaling Group spread across two Availability Zones to support performance and high availability.

- Operating System: Amazon Linux 2023 (Linux)
- Reason: Lightweight, secure, widely supported on AWS, and well-suited for Node.js hosting.

Server Configuration:
| Item | Choice |
|---|---|
| Instance Type | t3.small |
| vCPU / RAM | 2 vCPU / 2 GB |
| Storage | 20–30 GB gp3 EBS |
| Deployment | Auto Scaling Group (min 2, desired 2, max 4) |
| Availability | Instances spread across 2 Availability Zones |


## 6. Database Schema and Design
The system will use MySQL as the database management system hosted on AWS RDS to provide a managed, reliable relational database with automated backups and multi-AZ options. An ER diagram is included that follows third normal form (3NF) by separating entities such as Users, Courses, Sessions, and Enrollments and using primary/foreign keys and uniqueness constraints to prevent duplicate registrations and preserve data integrity.

- DBMS: MySQL
- Hosting: AWS RDS (MySQL)
- Design Standard: 3NF (third normal form) to reduce redundancy and enforce integrity through PK/FK relationships.

Key Constraints:
- Users.email must be unique.
- Enrollments must prevent duplicate registration for the same student in the same session (unique constraint on student_id + session_id).
- Sessions.max_enrollment is enforced so enrollments cannot exceed capacity.

## 7. Network Architecture and Security
The network architecture uses a dedicated VPC with redundant public and private subnets across two Availability Zones, placing the Application Load Balancer in public subnets and the application and database tiers in private subnets for isolation. Security groups will allow inbound HTTP/HTTPS (80/443) to the load balancer, allow only the application port (e.g., 3000) from the load balancer to the EC2 instances, allow MySQL (3306) only from the application tier to the database, and include restricted administrative access (SSH 22 for Linux or RDP 3389 for Windows) and ICMP/ping for troubleshooting from approved team IP addresses.

## 8. Data Visualization Tool Standard
Power BI is selected as the team’s data visualization standard because it provides strong dashboarding features, easy integration with relational data sources like MySQL, and useful AI-assisted insights for summarizing trends. It is also widely used in business environments, relatively cost-effective to scale, and familiar to many teams due to its integration with Microsoft tools.

## 9. Testing and Quality Assurance Process
Quality assurance during sprints will include unit testing with Jest to validate individual functions and modules, integration testing with tools like Supertest to verify API routes and database interactions, and end-to-end testing with Cypress (or Playwright) to validate complete user workflows from the UI. Tests will be run consistently during development (such as on pull requests through CI) to ensure changes do not break core functionality before code is merged.

## 10. Authentication and Authorization
For the initial build, the system is assumed to be open to anyone and does not require a fully implemented authentication provider, since detailed authentication and authorization processes are out of scope for this assignment. Even so, the application will define roles such as Student, Instructor, and Administrator to guide permissions and page access patterns in future iterations.

## 11. Team Responsibilities and Contribution Summary
Team responsibilities are divided so that a Cloud Architect defines AWS resources, an Application Developer defines the runtime and API design, a Database Architect produces the 3NF ERD, a Network Engineer designs the VPC/subnets and security rules, a QA Analyst defines the testing strategy, and a Project Manager coordinates timelines and merges deliverables. Each member contributed written sections and/or diagrams to this document, and any collaboration challenges (such as aligning schema definitions or resolving merge conflicts) were handled through team check-ins, shared standards, and final review before submission.

## 12. Collaboration and GitHub Proof
This architecture document and all supporting diagrams were committed to the team GitHub repository under the agreed documentation folder structure. A screenshot is included showing the document and diagram files in the repository to prove collaboration and successful posting.
