import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketDefinition, CloudFrontDefinition, ServiceDefinition, SupportedDefinition, TableDefinition, TaskDefinition } from './definition';
import { EnvironmentContext, ServiceContext } from './context';
import { ServiceTable } from './component/table';
import { ServiceComponentProps } from './component/component';
import { ServiceTask } from './component/task';
import { ServiceBucket } from './component/bucket';
import { ServiceGateway } from './component/cloudFront';

export class Service extends Stack {
  readonly context: ServiceContext;

  constructor(scope: Construct, environment: EnvironmentContext, definition: ServiceDefinition) {
    super(scope, definition.serviceName, {
      env: {
        account: environment.awsAccountId,
        region: environment.awsRegion,
      }
    });

    this.context = new ServiceContext({
      environment: environment,
      serviceName: definition.serviceName,
    });

    Object.entries(definition.components)
      .forEach(([componentName, definition]) => this.buildComponent(componentName, definition));
  }

  private buildComponent(componentName: string, definition: SupportedDefinition): void {
    if (Object.keys(definition).includes("partitionKey")) {
      new ServiceTable(this.getPropsFor(componentName), definition as TableDefinition);
    }
    else if (Object.keys(definition).includes("assetPath")) {
      new ServiceTask(this.getPropsFor(componentName), definition as TaskDefinition);
    }
    else if (Object.keys(definition).includes("bucketName")) {
      new ServiceBucket(this.getPropsFor(componentName), definition as BucketDefinition);
    }
    else if (Object.keys(definition).includes("domainNames")) {
      new ServiceGateway(this.getPropsFor(componentName), definition as CloudFrontDefinition);
    }
  }

  private getPropsFor(componentName: string): ServiceComponentProps {
    return {
      scope: this,
      context: this.context,
      name: componentName,
    }
  }
}
