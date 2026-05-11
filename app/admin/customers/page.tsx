export const dynamic = 'force-dynamic'

export default function AdminCustomers() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">
          Clientes_
        </h1>
        <p className="mt-2 text-sm text-gray-500 font-medium">
          Módulo de CRM em construção.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center border-dashed border-2">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center max-w-md">
          Em breve você poderá visualizar todo o histórico de compras, carrinhos abandonados e dados de contato dos seus clientes B2B aqui.
        </p>
      </div>
    </div>
  )
}