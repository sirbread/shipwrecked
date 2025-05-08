import FormInput from "../form/FormInput"
import { useActionState } from "react";
import { prisma } from "@/lib/prisma";

type FormSave = {
    errors: any,
    data: any
}

type ProfileProps = {
    name?: string,
    email: string,
    slack?: string
}

async function updateProfile(state: FormSave, payload: FormData) {
    "use server";
    const data: Record<string, any> = {};
    payload.entries().forEach(([key, value]) => (data[key as string] = value))

    try {
        const result = await prisma.user.update({
            where: {
                email: payload.get("email")! as string,
            },
            data
        });
        return { errors: undefined, data: result };
    } catch (err) {
        return { errors: err, data: undefined };
    }
}

export default function Profile(props: ProfileProps) {
    const [state, formAction, pending] = useActionState(updateProfile, {data: {}, errors: ""});

    return (
        <form>
            <FormInput
                placeholder="Name"
                fieldName="name"
                state={state}
            >Name</FormInput>
        </form>
    )
}