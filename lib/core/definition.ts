import { BehaviorOptions } from "aws-cdk-lib/aws-cloudfront";

export interface TaskDefinition {
    readonly assetPath: string;
    readonly port?: number;
}

export interface TableDefinition {
    readonly partitionKey: string;
    readonly sortKey?: string;
}

export interface BucketDefinition {
    readonly bucketName: string;
}

export interface GatewayDefinition {
    readonly domainNames: string[];
    readonly defaultBehavior?: BehaviorOptions;
}

export type SupportedDefinition = TableDefinition | TaskDefinition | BucketDefinition | GatewayDefinition;

export interface ServiceDefinition {
    readonly serviceName: string;
    readonly components: { [key: string]: SupportedDefinition };
}