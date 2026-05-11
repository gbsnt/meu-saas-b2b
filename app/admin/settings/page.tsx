export const dynamic = 'force-dynamic'

export default function AdminSettings() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">
          Configurações_
        </h1>
        <p className="mt-2 text-sm text-gray-500 font-medium">
          Ajustes da plataforma e da sua conta.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase">Perfil da Loja</h3>
            <p className="text-sm text-gray-500 mt-1">Atualize o nome, logo e informações de contato.</p>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Editar &rarr;</span>
        </div>
        
        <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase">Taxas e Frete</h3>
            <p className="text-sm text-gray-500 mt-1">Configure regras de entrega para o B2B.</p>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Editar &rarr;</span>
        </div>
      </div>
    </div>
  )
}