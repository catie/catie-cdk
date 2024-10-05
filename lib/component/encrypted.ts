import { ServiceComponent, ServiceComponentProps } from "./component";
import { Key } from "aws-cdk-lib/aws-kms";

export interface EncryptedComponentProps extends ServiceComponentProps {
    readonly key?: Key;
}

export class EncryptedComponent extends ServiceComponent {
    readonly key: Key;

    public constructor(props: EncryptedComponentProps) {
        super(props);
        this.key = props.key ?? new Key(this, `${this.componentName}Key`);
    }
}