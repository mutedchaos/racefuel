# Race fuel calculator

Simple race fuel calculator, meant to be used with sims.

Uses vue, no backend components and the output can be served over any HTTP server.

## Hosted at

The latest version from master can be found running at https://racefuel.mutedchaos.com/

## Running locally (suggestions)

### Locally

    npm run build
    npm run serve

    Access at http://localhost:5000

### Using docker

    docker build . --tag racefuel
    docker run -p 80:5000 racefuel

    Access at http://localhost:5000
