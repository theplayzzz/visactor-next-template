import Link from "next/link";
import Image from "next/image";

export default function VisActor() {
  return (
    <Link
      href="/"
      className="relative my-2 flex items-center justify-center px-4 py-4"
    >
      <div className="dot-matrix absolute left-0 top-0 -z-10 h-full w-full" />
      <Image
        src="/Meu projeto.png"
        alt="Logo"
        width={120}
        height={120}
        className="object-contain"
      />
    </Link>
  );
}
