import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3StaticWebsiteOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ServiceBucket } from './bucket';
import { GatewayDefinition } from '../core/definition';
import { CfnDNSSEC, HostedZone, KeySigningKey, PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { EncryptedComponent, EncryptedComponentProps } from '../core/component';
import { IKey, Key } from 'aws-cdk-lib/aws-kms';


export class ServiceGateway extends EncryptedComponent {
    readonly assetContainer: ServiceBucket;
    readonly hostedZones: { [key: string]: HostedZone };
    readonly distribution: Distribution;
    readonly keySigningKeyName?: string;

    constructor(props: EncryptedComponentProps, definition: GatewayDefinition) {
        super(props);

        this.assetContainer = new ServiceBucket(this.childProps("Assets"), { bucketName: `${this.context.serviceName}-assets` });

        this.keySigningKeyName = definition.keySigningKeyName;
        this.hostedZones = this.buildHostedZones(definition.domainNames);
        const certificate = this.buildCertificate(this.hostedZones);

        this.distribution = new Distribution(this, this.childName("CloudFront"), {
            defaultBehavior: definition.defaultBehavior ?? {
                origin: new S3StaticWebsiteOrigin(this.assetContainer.bucket),
            },
            domainNames: definition.domainNames,
            certificate: certificate,
            logBucket: this.assetContainer.logBucket,
        });
    }

    private buildCertificate(hostedZones: { [key: string]: HostedZone }): Certificate {
        const domains = Object.keys(hostedZones);
        const primary = domains[0];
        const alts = domains.slice(1, domains.length);
        return new Certificate(this, this.childName("Certificate"), {
            domainName: primary,
            subjectAlternativeNames: alts,
        })
    }

    private buildHostedZones(domainNames: string[]): { [key: string]: HostedZone } {
        const zones = domainNames.map(domain => [domain, this.buildHostedZone(domain)]);
        return Object.fromEntries(zones);
    }

    private buildHostedZone(domain: string): HostedZone {
        const zone = new PublicHostedZone(this, domain, { zoneName: domain });
        if (!this.keySigningKeyName) {
            return zone;
        }

        const base = domain.replace(".", "_").replace("-", "_");
        const keyName = `${base}_dns_signing_key`;
        const dnsKey = KeySigningKey.fromKeySigningKeyAttributes(this, keyName, {
            hostedZone: zone,
            keySigningKeyName: this.keySigningKeyName,
        });
        const dnssec = new CfnDNSSEC(this, `${base}_dnssec`, {
            hostedZoneId: zone.hostedZoneId
        });
        dnssec.node.addDependency(dnsKey);

        return zone;
    }
}
