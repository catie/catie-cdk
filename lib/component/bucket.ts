import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDefinition, StaticWebsiteDefinition } from "../core/definition";
import { RemovalPolicy } from "aws-cdk-lib";
import { EncryptedComponent, EncryptedComponentProps } from "../core/component";
import { S3StaticWebsiteOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { ServiceGateway } from "./gateway";

export class BaseBucket extends EncryptedComponent {

    protected defaultProps(bucketName: string): { [key: string]: any } {
        return {
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            bucketName: bucketName,
            autoDeleteObjects: true,
            removalPolicy: RemovalPolicy.DESTROY,
            enforceSSL: true,
        };
    }

    protected buildBucketName(bucketName: string): string {
        return `${bucketName.toLowerCase()}-${this.context.awsAccountId}-${this.context.awsRegion}-${this.context.stage}`;
    }

    protected buildLogBucket(bucketName: string): Bucket {
        return new Bucket(this, this.childName("Logs"), this.defaultProps(`${bucketName}-access-logs`));
    }
}

export class ServiceBucket extends BaseBucket {
    readonly bucket: Bucket;
    readonly logBucket: Bucket;

    public constructor(props: EncryptedComponentProps, definition: BucketDefinition) {
        super(props);

        const bucketName = this.buildBucketName(definition.bucketName);
        this.logBucket = this.buildLogBucket(bucketName);
        this.bucket = new Bucket(this, this.childName("Assets"), {
            ...this.defaultProps(bucketName),
            serverAccessLogsBucket: this.logBucket,
        });
    }

}
export class StaticWebsiteBucket extends BaseBucket {
    readonly bucket: Bucket;
    readonly logBucket: Bucket;

    public constructor(props: EncryptedComponentProps, definition: StaticWebsiteDefinition, existingWebsite?: StaticWebsiteBucket) {
        super(props);

        if (definition.bucketName) {
            const bucketName = this.buildBucketName(definition.bucketName);
            this.logBucket = this.buildLogBucket(bucketName);
            this.bucket = new Bucket(this, this.childName("Assets"), {
                ...this.defaultProps(bucketName),
                serverAccessLogsBucket: this.logBucket,
            });
        } else if (existingWebsite) {
            this.logBucket = existingWebsite.logBucket;
            this.bucket = existingWebsite.bucket;
        } else {
            throw new Error("No bucket or bucket name provided");
        }
    }

    public origin(): S3StaticWebsiteOrigin {
        return new S3StaticWebsiteOrigin(this.bucket);
    }
}