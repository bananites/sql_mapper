NSERT INTO customers (id, name, email, address, phone, created_at, metadata)
VALUES
    (1, 'Max Mustermann', 'max.mustermann@example.com', 'Musterstraße 1, 12345 Musterstadt', '+49 171 1234567', NOW(), '{"loyalty_points": 250, "preferred": true}'),
