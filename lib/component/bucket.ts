import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDefinition } from "../definition";
import { EncryptedComponent, EncryptedComponentProps } from "./encrypted";
import { RemovalPolicy } from "aws-cdk-lib";

export class ServiceBucket extends EncryptedComponent {
    readonly bucket: Bucket;
    readonly logBucket: Bucket;

    public constructor(props: EncryptedComponentProps, definition: BucketDefinition) {
        super(props);

        const bucketName = this.buildBucketName(definition.bucketName);
        this.logBucket = new Bucket(this, `${this.context.serviceName}Assets`, {
            bucketName: `${bucketName}-access-logs`,
            removalPolicy: RemovalPolicy.RETAIN,
            enforceSSL: true,
        });
        this.bucket = new Bucket(this, `${this.context.serviceName}Assets`, {
            bucketName: bucketName,
            removalPolicy: RemovalPolicy.RETAIN,
            serverAccessLogsBucket: this.logBucket,
            enforceSSL: true,
        });
    }

    public buildBucketName(bucketName: string): string {
        return `${bucketName}-${this.context.awsAccountId}-${this.context.awsRegion}`;
    }

}