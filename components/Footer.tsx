export default function Footer() {
    return (
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-[10px] font-bold uppercase tracking-widest">
            
            <div className="col-span-2 space-y-4">
              <span className="text-xl font-black text-gray-900 italic tracking-tighter">STUDIO_</span>
              <p className="text-gray-500 max-w-xs leading-relaxed">
                Curadoria minimalista focada em qualidade extrema e design atemporal. Feito para durar.
              </p>
            </div>
            
            <div>
              <h3 className="text-gray-900 mb-6">Shop</h3>
              <ul className="space-y-4 text-gray-400">
                <li><a href="/category/men" className="hover:text-gray-900 transition-colors">Men</a></li>
                <li><a href="/category/women" className="hover:text-gray-900 transition-colors">Women</a></li>
                <li><a href="/category/accessories" className="hover:text-gray-900 transition-colors">Accessories</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-900 mb-6">Support</h3>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
              </ul>
            </div>
            
          </div>
          
          <div className="mt-12 border-t border-gray-100 pt-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
            &copy; 2026 STUDIO_ INC. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    )
  }