import UserLoginForm from "./UserLoginForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_token")?.value;

    if (userId) {
        redirect("/sigarayadurde");
    }

    return (
        <main style={{ padding: "1rem" }}>
            <UserLoginForm />
        </main>
    );
}
