import { Router } from "express";
import {
  getBusinessMe,
  getCustomerOrders,
  getCustomerOrderById,
  getCustomerQuotations,
  acceptQuotation,
  rejectQuotation,
  getCustomerPayments,
  getCustomerDocuments,
  requestReorder,
  uploadOrderDesign,
  approveOrderDesign,
  getAdminB2BOrders,
  createAdminCustomOrder,
  updateAdminCustomOrderStatus,
  recordAdminCustomOrderPayment,
  reconcilePayment,
  attachAdminDocument,
  getAdminQuotations,
  convertQuotationToOrder,
  getBusinessCustomers,
  getCustomerLedgerReport,
} from "../controllers/b2bController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// ==========================================
// Customer B2B Portal Routes
// ==========================================
router.get("/me", requireAuth, getBusinessMe);
router.get("/orders", requireAuth, getCustomerOrders);
router.get("/orders/:id", requireAuth, getCustomerOrderById);
router.post("/orders/:id/reorder", requireAuth, requestReorder);
router.post("/orders/:id/upload-design", requireAuth, uploadOrderDesign);
router.post("/orders/:id/approve-design", requireAuth, approveOrderDesign);

router.get("/quotations", requireAuth, getCustomerQuotations);
router.post("/quotations/:id/accept", requireAuth, acceptQuotation);
router.post("/quotations/:id/reject", requireAuth, rejectQuotation);

router.get("/payments", requireAuth, getCustomerPayments);
router.get("/documents", requireAuth, getCustomerDocuments);

// ==========================================
// Admin B2B CRM & Manufacturing Routes
// ==========================================
router.get("/admin/orders", requireAdmin, getAdminB2BOrders);
router.post("/admin/orders", requireAdmin, createAdminCustomOrder);
router.patch("/admin/orders/:id/status", requireAdmin, updateAdminCustomOrderStatus);
router.post("/admin/orders/:id/payments", requireAdmin, recordAdminCustomOrderPayment);
router.post("/admin/orders/:id/documents", requireAdmin, attachAdminDocument);
router.post("/admin/payments/reconcile", requireAdmin, reconcilePayment);

router.get("/admin/quotations", requireAdmin, getAdminQuotations);
router.post("/admin/quotations/:id/convert-to-order", requireAdmin, convertQuotationToOrder);

router.get("/admin/customers", requireAdmin, getBusinessCustomers);
router.get("/admin/reports/ledger", requireAdmin, getCustomerLedgerReport);

export default router;
