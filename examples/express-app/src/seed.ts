import mongoose from "mongoose";
import { getDb } from "nodaro";

/**
 * Classic admin-style demo data: users, categories, products, orders,
 * plus wide_records (many columns — good for testing horizontal scroll).
 * Idempotent: skips if `users` already has documents (unless FORCE_SEED=1).
 */
export async function seedDemoData(): Promise<void> {
  if (process.env.NODARO_SEED === "0") {
    console.log("[demo] Seeding disabled (NODARO_SEED=0).");
    return;
  }

  const db = getDb();

  const force = process.env.FORCE_SEED === "1";
  if (!force) {
    const existing = await db.collection("users").estimatedDocumentCount();
    if (existing > 0) {
      console.log(
        "[demo] Seeding skipped — database already has data. Set FORCE_SEED=1 to reseed.",
      );
      return;
    }
  }

  if (force) {
    await db.dropCollection("orders").catch(() => {});
    await db.dropCollection("products").catch(() => {});
    await db.dropCollection("categories").catch(() => {});
    await db.dropCollection("users").catch(() => {});
  }

  const now = () => new Date();

  const u1 = new mongoose.Types.ObjectId();
  const u2 = new mongoose.Types.ObjectId();
  const u3 = new mongoose.Types.ObjectId();
  const u4 = new mongoose.Types.ObjectId();

  const c1 = new mongoose.Types.ObjectId();
  const c2 = new mongoose.Types.ObjectId();
  const c3 = new mongoose.Types.ObjectId();

  const p1 = new mongoose.Types.ObjectId();
  const p2 = new mongoose.Types.ObjectId();
  const p3 = new mongoose.Types.ObjectId();
  const p4 = new mongoose.Types.ObjectId();
  const p5 = new mongoose.Types.ObjectId();

  /** Many top-level fields (Parse-style wide rows) for UI horizontal scroll demos. */
  const wideIdA = new mongoose.Types.ObjectId();
  const wideIdB = new mongoose.Types.ObjectId();

  await db.collection("users").insertMany([
    {
      _id: u1,
      name: "Alex Rivera",
      email: "alex@example.com",
      role: "admin",
      active: true,
      createdAt: now(),
      lastLoginAt: now(),
    },
    {
      _id: u2,
      name: "Jordan Lee",
      email: "jordan@example.com",
      role: "user",
      active: true,
      createdAt: now(),
      lastLoginAt: null,
    },
    {
      _id: u3,
      name: "Sam Patel",
      email: "sam@example.com",
      role: "editor",
      active: true,
      createdAt: now(),
      lastLoginAt: now(),
    },
    {
      _id: u4,
      name: "Casey Morgan",
      email: "casey@example.com",
      role: "user",
      active: false,
      createdAt: now(),
      lastLoginAt: null,
    },
  ]);

  await db.collection("categories").insertMany([
    { _id: c1, name: "Electronics", slug: "electronics", sortOrder: 1 },
    { _id: c2, name: "Home & Kitchen", slug: "home-kitchen", sortOrder: 2 },
    { _id: c3, name: "Books", slug: "books", sortOrder: 3 },
  ]);

  await db.collection("products").insertMany([
    {
      _id: p1,
      name: "Wireless Mouse",
      sku: "EL-MSE-001",
      description: "Ergonomic 2.4GHz mouse with silent clicks.",
      price: 29.99,
      currency: "USD",
      categoryId: c1,
      stock: 120,
      tags: ["peripherals", "office"],
      published: true,
      createdAt: now(),
    },
    {
      _id: p2,
      name: "USB-C Hub",
      sku: "EL-HUB-014",
      description: "7-in-1 hub: HDMI, SD, USB-A, PD pass-through.",
      price: 49.5,
      currency: "USD",
      categoryId: c1,
      stock: 45,
      tags: ["usb-c", "laptop"],
      published: true,
      createdAt: now(),
    },
    {
      _id: p3,
      name: "Glass Kettle",
      sku: "HK-KTL-203",
      description: "1.7L borosilicate glass with auto shut-off.",
      price: 42.0,
      currency: "USD",
      categoryId: c2,
      stock: 30,
      tags: ["kitchen", "appliance"],
      published: true,
      createdAt: now(),
    },
    {
      _id: p4,
      name: "Desk Lamp LED",
      sku: "HK-LMP-088",
      description: "Warm/cool dimmable LED, touch control.",
      price: 36.0,
      currency: "USD",
      categoryId: c2,
      stock: 0,
      tags: ["lighting"],
      published: false,
      createdAt: now(),
    },
    {
      _id: p5,
      name: "MongoDB in Action",
      sku: "BK-MDB-501",
      description: "Patterns and recipes for document modeling.",
      price: 54.99,
      currency: "USD",
      categoryId: c3,
      stock: 200,
      tags: ["database", "reference"],
      published: true,
      createdAt: now(),
    },
  ]);

  await db.collection("orders").insertMany([
    {
      orderNumber: "ORD-1001",
      userId: u2,
      status: "delivered",
      total: 79.49,
      currency: "USD",
      items: [
        { productId: p1, title: "Wireless Mouse", qty: 1, unitPrice: 29.99 },
        { productId: p2, title: "USB-C Hub", qty: 1, unitPrice: 49.5 },
      ],
      shippingAddress: {
        line1: "12 Market St",
        city: "San Francisco",
        region: "CA",
        postalCode: "94103",
        country: "US",
      },
      createdAt: now(),
      updatedAt: now(),
    },
    {
      orderNumber: "ORD-1002",
      userId: u3,
      status: "shipped",
      total: 42.0,
      currency: "USD",
      items: [{ productId: p3, title: "Glass Kettle", qty: 1, unitPrice: 42.0 }],
      shippingAddress: {
        line1: "400 Congress Ave",
        city: "Austin",
        region: "TX",
        postalCode: "78701",
        country: "US",
      },
      createdAt: now(),
      updatedAt: now(),
    },
    {
      orderNumber: "ORD-1003",
      userId: u1,
      status: "paid",
      total: 54.99,
      currency: "USD",
      items: [
        { productId: p5, title: "MongoDB in Action", qty: 1, unitPrice: 54.99 },
      ],
      shippingAddress: {
        line1: "221B Baker St",
        city: "London",
        region: "ENG",
        postalCode: "NW1",
        country: "GB",
      },
      createdAt: now(),
      updatedAt: now(),
    },
    {
      orderNumber: "ORD-1004",
      userId: u4,
      status: "pending",
      total: 36.0,
      currency: "USD",
      items: [
        { productId: p4, title: "Desk Lamp LED", qty: 1, unitPrice: 36.0 },
      ],
      shippingAddress: {
        line1: "PO Box 99",
        city: "Portland",
        region: "OR",
        postalCode: "97201",
        country: "US",
      },
      createdAt: now(),
      updatedAt: now(),
    },
  ]);

  const t = now();
  await db.collection("wide_records").insertMany([
    {
      _id: wideIdA,
      recordKey: "WR-DEMO-001",
      tenantId: "tn_acme",
      applicationId: "app_web_checkout",
      sessionId: "sess_8f3a2c1d",
      requestId: "req_9b7e4a21",
      correlationId: "corr_m4n8p2q5",
      version: 3,
      revision: 12,
      priority: 2,
      score: 87.4,
      weightKg: 1.25,
      flagActive: true,
      flagIndexed: true,
      flagArchived: false,
      statusCode: 200,
      errorCode: null,
      createdBy: u1,
      updatedBy: u3,
      ownerId: u2,
      assigneeId: u4,
      reviewerId: u1,
      region: "us-west-2",
      locale: "en-US",
      timezone: "America/Los_Angeles",
      currency: "USD",
      language: "en",
      unitPrice: 19.99,
      quantity: 4,
      taxRate: 0.0825,
      discountPct: 0.1,
      totalCents: 7192,
      source: "api",
      channel: "web",
      campaign: "spring_2026",
      experiment: "exp_checkout_v3",
      variant: "B",
      lineNumber: 14,
      batchId: "BTH-88421",
      warehouseCode: "WH-SFO-01",
      aisle: "A",
      bin: "12-C",
      sku: "SKU-MIX-009",
      categoryCode: "CAT-MISC",
      supplierRef: "SUP-7712",
      purchaseOrder: "PO-2026-0144",
      invoiceId: "INV-99301",
      indexedAt: t,
      publishedAt: t,
      expiresAt: null,
      archivedAt: null,
      notes: "Wide row for table scroll / column overflow demos.",
      tagA: "demo",
      tagB: "wide",
      tagC: "parse-style",
      metaVersion: 1,
      checksum: "sha256:demo_placeholder",
    },
    {
      _id: wideIdB,
      recordKey: "WR-DEMO-002",
      tenantId: "tn_acme",
      applicationId: "app_mobile",
      sessionId: "sess_1a2b3c4d",
      requestId: "req_7c8d9e01",
      correlationId: "corr_x9y8z7w6",
      version: 1,
      revision: 4,
      priority: 0,
      score: 42,
      weightKg: 0.5,
      flagActive: false,
      flagIndexed: true,
      flagArchived: false,
      statusCode: 304,
      errorCode: null,
      createdBy: u3,
      updatedBy: u3,
      ownerId: u4,
      assigneeId: u2,
      reviewerId: null,
      region: "eu-central-1",
      locale: "de-DE",
      timezone: "Europe/Berlin",
      currency: "EUR",
      language: "de",
      unitPrice: 9.5,
      quantity: 2,
      taxRate: 0.19,
      discountPct: 0,
      totalCents: 2261,
      source: "import",
      channel: "mobile",
      campaign: "retention_q2",
      experiment: "exp_null",
      variant: "A",
      lineNumber: 3,
      batchId: "BTH-99102",
      warehouseCode: "WH-BER-02",
      aisle: "D",
      bin: "04-A",
      sku: "SKU-MIX-010",
      categoryCode: "CAT-DIGITAL",
      supplierRef: "SUP-2201",
      purchaseOrder: "PO-2026-0200",
      invoiceId: "INV-99388",
      indexedAt: t,
      publishedAt: t,
      expiresAt: t,
      archivedAt: null,
      notes: "Second wide row; same schema for stable columns.",
      tagA: "demo",
      tagB: "scroll",
      tagC: "ui",
      metaVersion: 2,
      checksum: "sha256:second_row",
    },
  ]);

  console.log(
    "[demo] Seeded: users, categories, products, orders, wide_records (wide table demo).",
  );
}
