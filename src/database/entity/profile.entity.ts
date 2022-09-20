import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique, ObjectIdColumn } from "typeorm";

@Entity()
export class Profile {
    @ObjectIdColumn()
    id: number;

    @Column({unique: true})
    discordId: string;

    @Column()
    name: string;

    @Column({ nullable: true, default: false })
    marketSet: boolean;

    @Column({nullable: true, default: []})
    marketsCredentials: [{
        marketName: string;
        clientId: string;
        clientSecret: string;
    }]; 
}