import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDefinition } from "../core/definition";
import { RemovalPolicy } from "aws-cdk-lib";
import { EncryptedComponent, EncryptedComponentProps } from "../core/component";

export class ServiceBucket extends EncryptedComponent {
    readonly bucket: Bucket;
    readonly logBucket: Bucket;

    public constructor(props: EncryptedComponentProps, definition: BucketDefinition) {
        super(props);

        const bucketName = this.bucketName(definition.bucketName);
        this.logBucket = new Bucket(this, this.childName("Logs"), {
            bucketName: `${bucketName}-access-logs`,
            autoDeleteObjects: true,
            removalPolicy: RemovalPolicy.DESTROY,
            enforceSSL: true,
        });
        this.bucket = new Bucket(this, this.childName("Assets"), {
            bucketName: bucketName,
            autoDeleteObjects: true,
            removalPolicy: RemovalPolicy.DESTROY,
            serverAccessLogsBucket: this.logBucket,
            enforceSSL: true,
        });
    }

    public bucketName(bucketName: string): string {
        return `${bucketName.toLowerCase()}-${this.context.awsAccountId}-${this.context.awsRegion}-${this.context.stage}`;
    }

}