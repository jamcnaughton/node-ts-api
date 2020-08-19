# node-ts-api
A very simple starter framework for an api using Node - all in Typescript.



## Dev Commands

The following commands assume you have NodeJs with NPM installed and are to be executed from the project's root directory.


### Set up

```bash
npm run api:install:dev
```

### Run on dev env

```bash
npm run api:start:dev
```

### Generate Docs

```bash
npm run api:doc
```

### Generate API Docs

```bash
npm run api:apidoc
```

### Lint

```bash
npm run api:lint
```

### Test

```bash
npm run api:test
```


## Database Commands

To be run after setting up API.

### Set up Docker Images

```bash
npm run db:environment
```

### Populate or update database

```bash
npm run db:migrate
```

### Rollback update to database

```bash
npm run db:migrate:back
```

### Wipe database

```bash
npm run db:wipe:dev
```

### Convert all current migrations into a seed

```bash
npm run db:migrate:squash
```


## Production Commands

### Set up

```bash
npm run api:install
```

### Build

```bash
npm run api:build
```

### Run

Install forever on the server and deploy the build there and run the following command:

```bash
npm run forever
```
