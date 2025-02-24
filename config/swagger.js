// import swaggerJSDoc from "swagger-jsdoc";
// import swaggerUi from "swagger-ui-express";
// import { PORT } from "./environments.js";
// import YAML from "yamljs";
// import path from "path";

// const swaggerSpec = YAML.load("./swagger.yaml");


// // const options = {
// //     definition: {
// //         openapi: "3.0.0",
// //         info: {
// //             title: "User & Role API",
// //             version: "1.0.0",
// //             description: "API documentation for User and Role management",
// //         },
// //         servers: [
// //             {
// //                 url: `http://localhost:${PORT || 3000}`,
// //                 description: "Development server",
// //             },
// //         ],
// //     },
// //     apis: ["./routes/*.js"], // Paths to API files
// // };

// // const swaggerSpec = swaggerJSDoc(options);

// const swaggerDocs = (app) => {
//     app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//     console.log(
//         `Swagger docs available at http://localhost:${PORT || 3000}/docs`
//     );
// };

// export default swaggerDocs;

import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "User & Role API",
        description: "API documentation for User and Role management",
        version: "1.0.0",
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Development Server",
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
};

const outputFile = "./swagger.yaml"; // Output YAML file
const endpointsFiles = ["./routes/admin.route.js", "./routes/auth.route.js", "./routes/role.route.js"]; // Paths to route files

swaggerAutogen({ openapi: "3.0.0", language: "yaml" })(outputFile, endpointsFiles, doc);
