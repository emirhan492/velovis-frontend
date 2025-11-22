// src/components/Footer.tsx

export default function Footer() {
  return (
    // w-full: Tam genişlik
    // border-t border-zinc-900: Üstte çok ince, zarif bir çizgi
    // py-6: Üstten ve alttan makul boşluk
    <footer className="w-full bg-black border-t border-zinc-900 py-8 mt-auto">
      <div className="container mx-auto px-6 flex justify-center items-center">
        <p className="text-zinc-600 text-xs font-medium tracking-wide">
          &copy; 2025 Velovis Wear. Powered by Emirhan Çelik.
        </p>
      </div>
    </footer>
  );
}