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
![ERD](diagrams/ERD.png)

## 7. Network Architecture and Security
The network architecture uses a dedicated VPC with redundant public and private subnets across two Availability Zones, placing the Application Load Balancer in public subnets and the application and database tiers in private subnets for isolation. Security groups will allow inbound HTTP/HTTPS (80/443) to the load balancer, allow only the application port (e.g., 3000) from the load balancer to the EC2 instances, allow MySQL (3306) only from the application tier to the database, and include restricted administrative access (SSH 22 for Linux or RDP 3389 for Windows) and ICMP/ping for troubleshooting from approved team IP addresses.

VPC and Subnets:
- VPC CIDR: 10.0.0.0/16
- Two Availability Zones for high availability
- Public Subnets (ALB): 10.0.1.0/24 (AZ-A), 10.0.2.0/24 (AZ-B)
- Private App Subnets (EC2): 10.0.11.0/24 (AZ-A), 10.0.12.0/24 (AZ-B)
- Private DB Subnets (RDS): 10.0.21.0/24 (AZ-A), 10.0.22.0/24 (AZ-B)
- Internet Gateway attached to the VPC
- NAT Gateway (recommended) enables private subnets to reach the internet for patching/updates

- Ports:
- 80 (HTTP), 443 (HTTPS)
- 3000 (Application)
- 3306 (MySQL)
- 22 (SSH for Linux administration) / 3389 (RDP for Windows administration)
- ICMP (ping) allowed only from approved team IPs for troubleshooting

Security Groups:
- SG-ALB:
  - Inbound: 80/443 from 0.0.0.0/0
  - Outbound: 3000 to SG-App
- SG-App (EC2):
  - Inbound: 3000 from SG-ALB
  - Inbound: 22 from Team IP only
  - Inbound: ICMP from Team IP only
  - Outbound: 3306 to SG-DB, 443 to internet (via NAT)
- SG-DB (RDS):
  - Inbound: 3306 from SG-App only
 
  - ![Network Diagram](diagrams/Network.png)


## 8. Data Visualization Tool Standard
Power BI is selected as the team’s data visualization standard because it provides strong dashboarding features, easy integration with relational data sources like MySQL, and useful AI-assisted insights for summarizing trends. It is also widely used in business environments, relatively cost-effective to scale, and familiar to many teams due to its integration with Microsoft tools.

Selected Standard: Power BI
Justification:
- Functionality: Interactive dashboards, drilldowns, KPIs, filters/slicers for stakeholders.
- AI and integration: Strong connectors and features for analyzing trends; integrates with MySQL data sources.
- Team familiarity: Common in business environments and easy to learn if familiar with Excel.
- Cost and scalability: Affordable entry options with scalable licensing for larger deployments.


## 9. Testing and Quality Assurance Process
Quality assurance during sprints will include unit testing with Jest to validate individual functions and modules, integration testing with tools like Supertest to verify API routes and database interactions, and end-to-end testing with Cypress (or Playwright) to validate complete user workflows from the UI. Tests will be run consistently during development (such as on pull requests through CI) to ensure changes do not break core functionality before code is merged.

Unit Testing:
- Tool: Jest
- Scope: Validation functions, controller logic, and utility modules.

Integration Testing:
- Tool: Supertest
- Scope: API routes with database interactions to ensure services work together correctly.

End-to-End Testing:
- Tool: Cypress (or Playwright)
- Scope: Full user workflows such as searching courses, registering for sessions, and confirming enrollment.

Process:
- Tests run on pull requests and before merging to main to ensure production code remains stable.


## 10. Authentication and Authorization
For the initial build, the system is assumed to be open to anyone and does not require a fully implemented authentication provider, since detailed authentication and authorization processes are out of scope for this assignment. Even so, the application will define roles such as Student, Instructor, and Administrator to guide permissions and page access patterns in future iterations.

The system is assumed to be open to anyone for initial building and testing, and detailed authentication/authorization implementation is out of scope. Roles are still defined for the application design: Student (search/register), Instructor (view schedule), and Administrator/Authorized User (view session enrollment lists).

## 11. Team Responsibilities and Contribution Summary
Team responsibilities are divided so that a Cloud Architect defines AWS resources, an Application Developer defines the runtime and API design, a Database Architect produces the ERD, a Network Engineer designs the VPC/subnets and security rules, a QA Analyst defines the testing strategy, and a Project Manager coordinates timelines and merges deliverables. Each member contributed written sections and/or diagrams to this document, and any collaboration challenges (such as aligning schema definitions or resolving merge conflicts) were handled through team check-ins, shared standards, and final review before submission.

Roles and Contributions:
- Cloud Architect: Selected AWS services, compute, scaling, and monitoring components.
- Application Developer: Defined Node/Express runtime, REST API design, endpoints, and port configuration.
- Database Architect: Built ERD in 3NF and documented schema constraints.
- Network Engineer: Designed VPC/subnets and security group ingress/egress rules; created network diagram.
- QA Analyst: Defined unit, integration, and end-to-end testing strategy and tools.
- Project Manager: Coordinated collaboration, ensured rubric coverage, and managed final document merge.

We all contributed meaningfully to the project and collaborated to complete the architecture document and supporting diagrams. Saleh served as the **Cloud Architect**, leading the selection of AWS services and defining the core cloud resources (EC2, RDS, S3, ALB, and scaling considerations). Yusuf served as the **Database Architect**, developing the database schema, creating the ER diagram, and ensuring the design aligns with **third normal form (3NF)**. Javad served as the **Network Engineer**, designing the VPC architecture with redundant public/private subnets, documenting firewall controls through security groups, and defining required port access for the application and database.

Because our project is currently focused on the foundational architecture document, the responsibilities of **Application Developer**, **QA Analyst**, and **Project Manager** were handled jointly by the team. As **Application Developer**, we collectively defined the runtime environment (Node.js), middleware (Express), RESTful API approach, and required port configurations (HTTP/HTTPS and the application port). As **QA Analyst**, we jointly documented the testing plan including unit, integration, and end-to-end testing approaches to be used during sprints. As **Project Manager**, we coordinated timelines and ensured the final document met the rubric and deliverables.

The main challenge during collaboration was organizing and updating files correctly in GitHub, including committing changes to the correct folders and avoiding merge conflicts when multiple people edited the same file. We resolved this by assigning ownership of major sections, using consistent file naming and folder structure, and having one person perform the final merge and verification to confirm that the document, diagrams, and GitHub proof screenshot were successfully pushed to the repository. Overall, everyone contributed fairly and stayed aligned with the assignment requirements.

Challenges and Resolutions:
We faced challenges aligning naming conventions and merging edits across multiple contributors. These were resolved by assigning one final editor to merge changes, using consistent standards for diagrams/tables, and reviewing before committing.

## 12. Collaboration and GitHub Proof
This architecture document and all supporting diagrams were committed to the team GitHub repository under the agreed documentation folder structure. A screenshot is included showing the document and diagram files in the repository to prove collaboration and successful posting.

![GitHub Proof](screenshots/github-proof.png)
