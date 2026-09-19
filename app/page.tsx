import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-12 text-center">
          <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            FixMy<span className="text-[#0078d4]">Campus</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Report campus issues instantly. Keep our environment safe, clean, and functioning. 
            Access is strictly restricted to verified GVPCE students and staff.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="px-8 py-4 bg-[#0078d4] text-white font-bold rounded-xl hover:bg-[#005a9e] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Sign in with @gvpce.ac.in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
