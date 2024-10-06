import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EnvironmentContext, ServiceContext } from './context';
import { ServiceTable } from '../component/table';
import { ServiceComponentProps } from './component';
import { ServiceTask } from '../component/task';
import { ServiceBucket } from '../component/bucket';
import { ServiceGateway } from '../component/gateway';
import { ServiceDefinition, SupportedDefinition } from './definition';

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

  // TODO: Find a cleaner way to do this
  private buildComponent(componentName: string, definition: SupportedDefinition): void {
    const props = this.componentProps(componentName);
    if (Object.keys(definition).includes("partitionKey")) {
      ServiceTable.forDefinition(props, definition);
    }
    else if (Object.keys(definition).includes("assetPath")) {
      ServiceTask.forDefinition(props, definition);
    }
    else if (Object.keys(definition).includes("bucketName")) {
      ServiceBucket.forDefinition(props, definition);
    }
    else if (Object.keys(definition).includes("domainNames")) {
      ServiceGateway.forDefinition(props, definition);
    }
  }

  private componentProps(componentName: string): ServiceComponentProps {
    return {
      scope: this,
      context: this.context,
      name: componentName,
    }
  }
}
