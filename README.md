# Cat Notes Web

A web-based note-taking application and backend API for the Cat Notes ecosystem. It provides note management functionality through a browser and exposes REST APIs for the Android and iOS applications.

Originally developed based on an online course, the project has been significantly extended with additional features, testing, deployment automation, and independent development.

## Features

- **Note Management:** Create, view, edit, and delete notes.
- **Secure Notes:** Manage private notes with additional security features.
- **User Authentication:** Manage user authentication and access.
- **Email Services:** Send registration emails, password reset emails, and notifications using Mailtrap.
- **REST API:** Provide backend services for the Cat Notes Android and iOS applications.
- **Cross-Platform Integration:** Share backend functionality across web, Android, and iOS clients.
- **Data Management:** Store, retrieve, and manage note data.
- **Responsive Interface:** Access and manage notes through a web browser.

## Technologies

- JavaScript
- React
- Vite
- HTML
- CSS
- REST APIs
- Clerk
- Mailtrap
- Vitest
- Supertest
- GitHub Actions
- CI/CD

## Testing

- **Vitest:** Automated testing for application functionality.
- **Supertest:** Testing backend HTTP endpoints and REST API behavior.
- **Automated Test Execution:** Run tests through GitHub Actions workflows.

## CI/CD and Deployment

- **GitHub Actions:** Automate testing and deployment workflows.
- **Continuous Integration:** Automatically execute tests when code changes are pushed.
- **Continuous Deployment:** Automate application deployment to a VPS.
- **Deployment Automation:** Streamline the release process and reduce manual deployment steps.

## Architecture

Cat Notes uses a shared backend API to support multiple client applications.

- **Web:** Browser-based note management.
- **Android:** Native Android application.
- **iOS:** Native iOS application.
- **Backend API:** Provides shared services for authentication, note management, and email functionality.

## Screenshots

<!-- Add application screenshots here -->

## Related Projects

- [Cat Notes Android](https://github.com/watercyb/cat-notes-android)
- [Cat Notes iOS](https://github.com/watercyb/cat-notes-ios)

## Acknowledgments

The initial project was developed based on an online course and subsequently expanded with additional features, improvements, and independent development.

Original course: [The Web Developer Bootcamp](https://www.udemy.com/course/the-web-dev-bootcamp)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
