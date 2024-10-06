import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDefinition, SupportedDefinition } from "../core/definition";
import { RemovalPolicy } from "aws-cdk-lib";
import { EncryptedComponent, EncryptedComponentProps, ServiceComponent, ServiceComponentProps } from "../core/component";

export class ServiceBucket extends EncryptedComponent {
    readonly bucket: Bucket;
    readonly logBucket: Bucket;

    public constructor(props: EncryptedComponentProps, definition: BucketDefinition) {
        super(props);

        const bucketName = this.bucketName(definition.bucketName);
        this.logBucket = new Bucket(this, this.childName("Logs"), {
            bucketName: `${bucketName}-access-logs`,
            removalPolicy: RemovalPolicy.RETAIN,
            enforceSSL: true,
        });
        this.bucket = new Bucket(this, this.childName("Assets"), {
            bucketName: bucketName,
            removalPolicy: RemovalPolicy.RETAIN,
            serverAccessLogsBucket: this.logBucket,
            enforceSSL: true,
        });
    }

    public bucketName(bucketName: string): string {
        return `${bucketName.toLowerCase()}-${this.context.awsAccountId}-${this.context.awsRegion}-${this.context.stage}`;
    }

    public static forDefinition(props: ServiceComponentProps, definition: SupportedDefinition): ServiceComponent {
        return new ServiceBucket(props, definition as BucketDefinition);
    }
}