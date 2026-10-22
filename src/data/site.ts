// Única fuente de verdad de los datos del negocio. La usan las páginas,
// el JSON-LD, el asistente y los textos legales: si algo cambia, se cambia acá.

export const SITE_URL = 'https://matecito.qzz.io';

export const BUSINESS = {
  name: 'Matecito Tech',
  founder: 'Mateo Gariboglio',
  email: 'matecito.tech@gmail.com',
  phoneDisplay: '+54 342 537-0985',
  whatsapp: '543425370985',
  city: 'Humboldt',
  region: 'Santa Fe',
  postalCode: '3081',
  country: 'Argentina',
  // Datos fiscales exigidos por la Ley 24.240 (art. 4) y el CCyC (art. 1100):
  // completar para que se muestren en el pie y en los textos legales.
  legalName: '',
  cuit: '',
  address: '',
  // URL del código QR de "Data Fiscal" de ARCA (ex AFIP). Vacío = no se muestra.
  dataFiscalUrl: '',
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${BUSINESS.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export type PlanId = 'landing' | 'automatizacion' | 'ecommerce' | 'mantenimiento';

export const PLANS: { id: PlanId; name: string; usd: number; unit: string; fit: string; items: string[] }[] = [
  { id: 'landing', name: 'Página web', usd: 250, unit: 'desde, pago único', fit: 'Para negocios que necesitan aparecer en Google y recibir consultas.', items: ['Diseño a medida, adaptado a celulares', 'Botón de WhatsApp con mensaje armado', 'SEO base y alta en Google', 'Dominio y hosting configurados'] },
  { id: 'automatizacion', name: 'Sistema a medida', usd: 350, unit: 'desde, pago único', fit: 'Para ordenar turnos, stock o clientes que hoy viven en planillas.', items: ['Relevamiento de tu proceso', 'Acceso desde la compu o el celular', 'Usuarios y permisos', 'Capacitación al equipo'] },
  { id: 'ecommerce', name: 'Tienda online', usd: 550, unit: 'desde, pago único', fit: 'Para vender por internet sin depender solo de las redes.', items: ['Tiendanube, WooCommerce o a medida', 'Cobros con Mercado Pago', 'Envíos integrados', 'Panel para ver tus pedidos'] },
  { id: 'mantenimiento', name: 'Mantenimiento', usd: 50, unit: 'por mes, sin permanencia', fit: 'Para que tu sitio siga rápido, seguro y actualizado.', items: ['Actualizaciones y seguridad', 'Copias de seguridad', 'Cambios menores de contenido', 'Soporte por WhatsApp o email'] },
];

export const LEGAL_UPDATED = '22 de octubre de 2026';
