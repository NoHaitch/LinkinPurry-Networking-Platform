import Footer from "@/components/footer";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";

function Error401Page() {
  return (
    <div className="flex h-screen flex-col justify-center">
      <main className="container mx-auto w-[90%] max-w-2xl items-center justify-center gap-2 rounded-xl bg-white px-4 py-12 text-center">
        <h1 className="text-3xl font-bold md:text-7xl">401</h1>
        <h2 className="my-4 text-xl font-bold text-zinc-600 md:text-3xl">
          Unauthorized Access
        </h2>
        <Link
          to="/"
          className="mt-8 flex items-center justify-center gap-1 text-zinc-500 transition-colors hover:text-zinc-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Home
        </Link>
      </main>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}

export default Error401Page;
