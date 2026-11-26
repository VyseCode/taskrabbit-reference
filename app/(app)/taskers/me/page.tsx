import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getTaskerProfileByUserId } from "@/lib/queries";
import { ProfileForm } from "@/components/ProfileForm";

export const metadata = { title: "My tasker profile" };

export default async function MyTaskerProfilePage() {
  await connectDB();
  const user = await getSessionUser();
  const profile = user ? await getTaskerProfileByUserId(user.id) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My tasker profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Show clients your skills, rates and availability. Your rating is built from completed jobs.
        </p>
      </div>
      <ProfileForm initial={profile} />
    </div>
  );
}
