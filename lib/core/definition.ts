export interface GatewayDefinition {
    readonly domainNames: string[];
    readonly bucketName?: string;
    readonly keySigningKeyName?: string;
}

export interface StaticWebsiteDefinition {
    readonly isWebsite: boolean;
    readonly bucketName?: string;
    readonly domainNames?: string[];
}

export interface BucketDefinition {
    readonly bucketName: string;
}

export interface TaskDefinition {
    readonly assetPath: string;
    readonly port?: number;
}

export interface TableDefinition {
    readonly partitionKey: string;
    readonly sortKey?: string;
}

export type ComponentDefinition = TableDefinition | TaskDefinition | BucketDefinition | StaticWebsiteDefinition;

export interface ServiceDefinition {
    readonly serviceName: string;
    readonly gateway?: GatewayDefinition;
    readonly components: { [key: string]: ComponentDefinition };
}