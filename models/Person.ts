import {Company} from "./Company";

export class Person {
    name: string;
    email: string;
    password?: string;
    photo?: string;
    discount?: string;
    companies?: Company[];
    agreeToTerms?: boolean;
    agreeToTermsDate?: Date;

    constructor(name: string, email: string, password?: string, photo?: string, discount?: string, companies?: Company[],
                agreeToTerms?: boolean, agreeToTermsDate?: Date) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.photo = photo;
        this.discount = discount;
        this.companies = companies;
        this.agreeToTerms = agreeToTerms;
        this.agreeToTermsDate = agreeToTermsDate;
    }
}