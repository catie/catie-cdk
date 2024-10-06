import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EnvironmentContext, ServiceContext } from './context';
import { ServiceTable } from '../component/table';
import { ServiceComponentProps } from './component';
import { ServiceTask } from '../component/task';
import { ServiceBucket, StaticWebsiteBucket } from '../component/bucket';
import { ServiceGateway } from '../component/gateway';
import { ServiceDefinition, ComponentDefinition, TableDefinition, BucketDefinition, StaticWebsiteDefinition, TaskDefinition } from './definition';

export class Service extends Stack {
  readonly context: ServiceContext;
  readonly gateway?: ServiceGateway;

  constructor(scope: Construct, environment: EnvironmentContext, definition: ServiceDefinition) {
    super(scope, `${definition.serviceName}-${environment.stage}`, {
      env: {
        account: environment.awsAccountId,
        region: environment.awsRegion,
      },
      crossRegionReferences: true,
    });

    this.context = new ServiceContext({
      environment: environment,
      serviceName: definition.serviceName,
    });

    if (definition.gateway) {
      this.gateway = new ServiceGateway(this.componentProps("Gateway"), definition.gateway);
    }

    Object.entries(definition.components)
      .forEach(([componentName, definition]) => this.buildComponent(componentName, definition));
  }

  // TODO: Find a cleaner way to do this
  private buildComponent(componentName: string, definition: ComponentDefinition): void {
    const props = this.componentProps(componentName);
    const definedFields = Object.keys(definition);

    if (definedFields.includes("partitionKey")) {
      new ServiceTable(props, definition as TableDefinition);
    }
    else if (definedFields.includes("assetPath")) {
      new ServiceTask(props, definition as TaskDefinition);
    }
    else if (definedFields.includes("isWebsite")) {
      if (!this.gateway) {
        throw new Error("No service gateway defined");
      }
      const website = new StaticWebsiteBucket(props, definition as StaticWebsiteDefinition, this.gateway.assetContainer);
      this.gateway.addStaticWebsite(website);
    }
    else if (definedFields.includes("bucketName")) {
      new ServiceBucket(props, definition as BucketDefinition);
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
