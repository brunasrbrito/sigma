type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };

type RequestOptions = {
  expectedStatus?: number;
  body?: Json;
};

type CreatedResources = {
  profileId?: number;
  userId?: number;
  supplierId?: number;
  lotId?: number;
  movementId?: number;
  dismembermentId?: number;
  productIds: number[];
};

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';

const created: CreatedResources = {
  productIds: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function request<T = unknown>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers();
  headers.set('Accept', 'application/json');

  let body: string | undefined;
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body,
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as T) : (undefined as T);
  const expectedStatus = options.expectedStatus ?? 200;

  if (response.status !== expectedStatus) {
    throw new Error(
      `${method} ${path} retornou ${response.status}, esperado ${expectedStatus}. Resposta: ${text || '<vazia>'}`,
    );
  }

  return payload;
}

async function step<T>(name: string, action: () => Promise<T>) {
  process.stdout.write(`\n[TESTE] ${name} ... `);

  try {
    const result = await action();
    console.log('OK');
    return result;
  } catch (error) {
    console.log('FALHOU');
    throw error;
  }
}

function expectNumber(value: unknown, label: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} invalido: ${String(value)}`);
  }
  return value;
}

function nowSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function cleanup() {
  const deleteIfExists = async (path: string) => {
    try {
      await request('DELETE', path);
    } catch {
      // cleanup best-effort
    }
  };

  if (created.dismembermentId) {
    await deleteIfExists(`/dismemberments/${created.dismembermentId}`);
  }
  if (created.movementId) {
    await deleteIfExists(`/movements/${created.movementId}`);
  }
  if (created.lotId) {
    await deleteIfExists(`/lots/${created.lotId}`);
  }
  if (created.supplierId) {
    await deleteIfExists(`/suppliers/${created.supplierId}`);
  }
  for (const productId of [...created.productIds].reverse()) {
    await deleteIfExists(`/products/${productId}`);
  }
  if (created.userId) {
    await deleteIfExists(`/users/${created.userId}`);
  }
  if (created.profileId) {
    await deleteIfExists(`/profiles/${created.profileId}`);
  }
}

async function main() {
  const suffix = nowSuffix();

  // ── DASHBOARD ────────────────────────────────────────────────────────────────
  await step('GET /dashboard', async () => {
    const payload = await request('GET', '/dashboard');
    if (!isRecord(payload) || !isRecord(payload.summary)) {
      throw new Error('Resposta de dashboard invalida');
    }
    return payload;
  });

  // ── PROFILES ─────────────────────────────────────────────────────────────────
  const profile = await step('POST /profiles', async () => {
    const payload = await request<{ id: number; name: string }>('POST', '/profiles', {
      body: { name: `Perfil API Flow ${suffix}` },
      expectedStatus: 201,
    });
    created.profileId = expectNumber(payload.id, 'profile.id');
    return payload;
  });

  await step('GET /profiles', async () => request('GET', '/profiles'));
  await step('GET /profiles/:id', async () =>
    request('GET', `/profiles/${created.profileId}`),
  );
  await step('PUT /profiles/:id', async () =>
    request('PUT', `/profiles/${created.profileId}`, {
      body: { name: `Perfil API Flow Atualizado ${suffix}` },
    }),
  );

  // ── USERS ─────────────────────────────────────────────────────────────────────
  const user = await step('POST /users', async () => {
    const payload = await request<{ id: number }>('POST', '/users', {
      body: {
        name: `Usuario API Flow ${suffix}`,
        email: `api-flow-${suffix}@example.com`,
        password: 'Senha123!',
        profileId: profile.id,
        active: true,
      },
      expectedStatus: 201,
    });
    created.userId = expectNumber(payload.id, 'user.id');
    return payload;
  });

  await step('GET /users', async () => request('GET', '/users'));
  await step('GET /users/:id', async () => request('GET', `/users/${user.id}`));
  await step('PUT /users/:id', async () =>
    request('PUT', `/users/${user.id}`, {
      body: { name: `Usuario API Flow Atualizado ${suffix}`, active: true },
    }),
  );
  await step('PUT /users/:id/reset-password', async () =>
    request('PUT', `/users/${user.id}/reset-password`, {
      body: { newPassword: 'Senha123!Atualizada' },
    }),
  );

  // ── PRODUCTS ──────────────────────────────────────────────────────────────────
  const originProduct = await step('POST /products (origem)', async () => {
    const payload = await request<{ id: number }>('POST', '/products', {
      body: {
        wood_type: 'Tora',
        scientific_name: `Scientific ${suffix}`,
        common_name: `Origem ${suffix}`,
        height_cm: 30,
        width_cm: 30,
        length_m: 2,
        active: true,
      },
      expectedStatus: 201,
    });
    created.productIds.push(expectNumber(payload.id, 'originProduct.id'));
    return payload;
  });

  const destinationProduct = await step('POST /products (destino)', async () => {
    const payload = await request<{ id: number }>('POST', '/products', {
      body: {
        wood_type: 'Prancha',
        scientific_name: `Scientific Dest ${suffix}`,
        common_name: `Destino ${suffix}`,
        height_cm: 15,
        width_cm: 30,
        length_m: 2,
        active: true,
      },
      expectedStatus: 201,
    });
    created.productIds.push(expectNumber(payload.id, 'destinationProduct.id'));
    return payload;
  });

  await step('GET /products', async () => request('GET', '/products'));
  await step('GET /products/:id', async () =>
    request('GET', `/products/${originProduct.id}`),
  );
  await step('PUT /products/:id', async () =>
    request('PUT', `/products/${originProduct.id}`, {
      body: { common_name: `Origem Atualizada ${suffix}` },
    }),
  );

  // ── SUPPLIERS ─────────────────────────────────────────────────────────────────
  const supplier = await step('POST /suppliers', async () => {
    const rawCnpj = `${Date.now()}`.padStart(14, '0').slice(-14);
    const payload = await request<{ id: number }>('POST', '/suppliers', {
      body: {
        name: `Fornecedor API Flow ${suffix}`,
        cnpj: rawCnpj,
        contact: 'contato@example.com',
      },
      expectedStatus: 201,
    });
    created.supplierId = expectNumber(payload.id, 'supplier.id');
    return payload;
  });

  await step('GET /suppliers', async () => request('GET', '/suppliers'));
  await step('GET /suppliers/:id', async () =>
    request('GET', `/suppliers/${supplier.id}`),
  );
  await step('PUT /suppliers/:id', async () =>
    request('PUT', `/suppliers/${supplier.id}`, {
      body: { contact: 'contato-atualizado@example.com' },
    }),
  );

  // ── LOTS ──────────────────────────────────────────────────────────────────────
  const lot = await step('POST /lots', async () => {
    const payload = await request<{ id: number }>('POST', '/lots', {
      body: {
        dofNumber: `DOF-${suffix}`,
        supplierId: supplier.id,
        entryDate: '2026-05-07',
        items: [{ productId: originProduct.id, quantity: 12 }],
      },
      expectedStatus: 201,
    });
    created.lotId = expectNumber(payload.id, 'lot.id');
    return payload;
  });

  await step('GET /lots', async () => request('GET', '/lots'));
  await step('GET /lots/:id', async () => request('GET', `/lots/${lot.id}`));
  await step('PUT /lots/:id', async () =>
    request('PUT', `/lots/${lot.id}`, {
      body: { items: [{ productId: originProduct.id, quantity: 14 }] },
    }),
  );

  // ── STOCK ─────────────────────────────────────────────────────────────────────
  await step('GET /stock', async () => request('GET', '/stock'));
  await step('GET /stock/products', async () => request('GET', '/stock/products'));
  await step('GET /stock/species', async () => request('GET', '/stock/species'));
  await step('GET /stock/products/:id', async () =>
    request('GET', `/stock/products/${originProduct.id}`),
  );

  // ── MOVEMENTS ─────────────────────────────────────────────────────────────────
  const movement = await step('POST /movements', async () => {
    const payload = await request<{ id: number }>('POST', '/movements', {
      body: {
        type: 'saida',
        productId: originProduct.id,
        quantity: 2,
        observation: 'Teste automatizado',
      },
      expectedStatus: 201,
    });
    created.movementId = expectNumber(payload.id, 'movement.id');
    return payload;
  });

  await step('GET /movements', async () => request('GET', '/movements'));
  await step('GET /movements/:id', async () =>
    request('GET', `/movements/${movement.id}`),
  );
  await step('PUT /movements/:id', async () =>
    request('PUT', `/movements/${movement.id}`, {
      body: { observation: 'Teste automatizado atualizado' },
    }),
  );

  // ── DISMEMBERMENTS ────────────────────────────────────────────────────────────
  const dismemberment = await step('POST /dismemberments', async () => {
    const payload = await request<{ id: number }>('POST', '/dismemberments', {
      body: {
        originProductId: originProduct.id,
        originQuantity: 2,
        items: [{ destinationProductId: destinationProduct.id, quantity: 4 }],
      },
      expectedStatus: 201,
    });
    created.dismembermentId = expectNumber(payload.id, 'dismemberment.id');
    return payload;
  });

  await step('GET /dismemberments', async () => request('GET', '/dismemberments'));
  await step('GET /dismemberments/:id', async () =>
    request('GET', `/dismemberments/${dismemberment.id}`),
  );

  // ── DOF ───────────────────────────────────────────────────────────────────────
  await step('GET /dof', async () => request('GET', '/dof'));

  // ── DASHBOARD (após dados) ────────────────────────────────────────────────────
  await step('GET /dashboard (com dados)', async () => {
    const payload = await request('GET', '/dashboard');
    if (!isRecord(payload) || !isRecord(payload.summary)) {
      throw new Error('Resposta de dashboard invalida');
    }
    return payload;
  });

  // ── CLEANUP (DELETE em ordem reversa) ────────────────────────────────────────
  await step('DELETE /dismemberments/:id', async () => {
    await request('DELETE', `/dismemberments/${dismemberment.id}`);
    created.dismembermentId = undefined;
  });

  await step('DELETE /movements/:id', async () => {
    await request('DELETE', `/movements/${movement.id}`);
    created.movementId = undefined;
  });

  await step('DELETE /lots/:id', async () => {
    await request('DELETE', `/lots/${lot.id}`);
    created.lotId = undefined;
  });

  await step('DELETE /suppliers/:id', async () => {
    await request('DELETE', `/suppliers/${supplier.id}`);
    created.supplierId = undefined;
  });

  await step('DELETE /products/:id (destino)', async () => {
    await request('DELETE', `/products/${destinationProduct.id}`);
    created.productIds = created.productIds.filter((id) => id !== destinationProduct.id);
  });

  await step('DELETE /products/:id (origem)', async () => {
    await request('DELETE', `/products/${originProduct.id}`);
    created.productIds = created.productIds.filter((id) => id !== originProduct.id);
  });

  await step('DELETE /users/:id', async () => {
    await request('DELETE', `/users/${user.id}`);
    created.userId = undefined;
  });

  await step('DELETE /profiles/:id', async () => {
    await request('DELETE', `/profiles/${profile.id}`);
    created.profileId = undefined;
  });

  console.log('\nTodos os testes passaram com sucesso.');
}

main().catch(async (error) => {
  console.error('\nErro no teste:', error);
  await cleanup();
  process.exitCode = 1;
});
