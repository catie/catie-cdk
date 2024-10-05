import { Attribute, AttributeType, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { TableDefinition } from "../definition";
import { Function } from "aws-cdk-lib/aws-lambda";
import { IPrincipal } from "aws-cdk-lib/aws-iam";
import { EncryptedComponent, EncryptedComponentProps } from "./encrypted";

export class ServiceTable extends EncryptedComponent {
    readonly table: Table;
    readonly handler: Function;

    public constructor(props: EncryptedComponentProps, definition: TableDefinition) {
        super(props);

        const partitionKey = this.buildKey(definition.partitionKey);
        const sortKey = this.buildKey(definition.sortKey);
        if (!partitionKey) {
            throw new Error(`No partition key defined for ${this.componentName} table`);
        }

        this.table = new Table(this, `${this.componentName}-table`, {
            tableName: `${this.componentName}-${this.context.stage}`,
            partitionKey: partitionKey,
            sortKey: sortKey,
            encryptionKey: this.key,
            encryption: TableEncryption.CUSTOMER_MANAGED,
        });
    }

    private buildKey(keyName?: string): Attribute | undefined {
        if (!keyName) {
            return undefined;
        }

        return {
            type: AttributeType.STRING,
            name: keyName,
        };
    }

    public grantAccess(principal: IPrincipal): void {
        this.table.grantReadWriteData(principal);
    }
}