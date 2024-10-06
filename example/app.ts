import { App } from 'aws-cdk-lib';
import { EnvironmentContext, Service } from '../lib';
import { staticWebsite } from './staticWebsite';

const app = new App();
const environment = EnvironmentContext.fromEnvironment();

new Service(app, environment, staticWebsite);