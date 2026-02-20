-- Wedding Planner - Seed Data
-- Run in Supabase SQL Editor after migrations
-- Generic placeholders only (no personal info)

-- Vendors
INSERT INTO vendors (id, category, name, contact_name, phone, email, instagram, website, quoted_price, amount_paid, next_payment_date, status, notes, deleted)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Photography', 'Example Photography', 'Contact Person', '+15550000001', 'contact@example.com', 'examplephoto', 'https://example.com', 2500.00, 500.00, '2025-03-15', 'booked', 'Main photographer for ceremony and reception', false),
  ('11111111-1111-1111-1111-111111111102', 'Catering', 'Example Catering Co', 'Contact Person', '+15550000002', 'contact@example.com', NULL, 'https://example.com', 8000.00, 2000.00, '2025-04-01', 'shortlisted', 'Tasting scheduled for next week', false),
  ('11111111-1111-1111-1111-111111111103', 'Venue', 'Example Venue', 'Contact Person', '+15550000003', 'events@example.com', 'examplevenue', 'https://example.com', 15000.00, 5000.00, '2025-05-01', 'booked', 'Reception venue - deposit paid', false),
  ('11111111-1111-1111-1111-111111111104', 'Florist', 'Example Florist', 'Contact Person', '+15550000004', 'contact@example.com', 'exampleflorist', NULL, 1200.00, NULL, NULL, 'shortlisted', NULL, false),
  ('11111111-1111-1111-1111-111111111105', 'Music', 'Example DJ', 'Contact Person', '+15550000005', 'contact@example.com', NULL, NULL, 800.00, 400.00, '2025-06-01', 'rejected', 'Went with live band instead', false)
ON CONFLICT (id) DO NOTHING;

-- Activities
INSERT INTO activities (id, title, date, start_time, end_time, location, notes, deleted)
VALUES
  ('22222222-2222-2222-2222-222222222201', 'Venue Tour', '2025-02-20', '14:00', '16:00', 'Example Venue', 'Second visit - confirm layout', false),
  ('22222222-2222-2222-2222-222222222202', 'Photographer Meeting', '2025-02-25', '10:00', '11:00', 'Example Studio', 'Review shot list and timeline', false),
  ('22222222-2222-2222-2222-222222222203', 'Catering Tasting', '2025-03-05', '18:00', '20:00', 'Example Catering Kitchen', 'Taste 3 menu options', false),
  ('22222222-2222-2222-2222-222222222204', 'Florist Consultation', '2025-03-12', '15:00', '16:00', 'Example Florist', 'Discuss bouquet and centerpiece styles', false),
  ('22222222-2222-2222-2222-222222222205', 'Wedding Rehearsal', '2025-06-14', '17:00', '18:30', 'Example Venue', 'Full run-through with vendors', false)
ON CONFLICT (id) DO NOTHING;

-- Tasks
INSERT INTO tasks (id, title, description, assignee, due_date, priority, status, deleted)
VALUES
  ('33333333-3333-3333-3333-333333333301', 'Send invites', 'Order and mail wedding invitations to guest list', 'Groom', '2025-03-01', 'high', 'todo', false),
  ('33333333-3333-3333-3333-333333333302', 'Confirm menu with caterer', 'Finalize menu choices after tasting', 'Bride', '2025-03-10', 'medium', 'todo', false),
  ('33333333-3333-3333-3333-333333333303', 'Book florist', 'Sign contract and pay deposit with Example Florist', 'Groom', '2025-03-20', 'medium', 'doing', false),
  ('33333333-3333-3333-3333-333333333304', 'Create seating chart', 'Assign tables for reception', 'Bride', '2025-05-15', 'low', 'todo', false),
  ('33333333-3333-3333-3333-333333333305', 'Final payment - photographer', 'Pay remaining balance to Example Photography', 'Groom', '2025-03-15', 'high', 'todo', false)
ON CONFLICT (id) DO NOTHING;

-- Notes
INSERT INTO notes (id, title, body, tags, deleted)
VALUES
  ('44444444-4444-4444-4444-444444444401', 'Venue decision', 'Chose Example Venue over Riverside Hall. Example Venue has better parking and indoor backup for rain.', NULL, false),
  ('44444444-4444-4444-4444-444444444402', 'Guest count estimate', 'Roughly 120 guests. Need final RSVP count by May 1 for catering.', 'guests', false),
  ('44444444-4444-4444-4444-444444444403', 'Photographer notes', 'Photographer prefers golden hour shots. Schedule sunset photos for 6:30 PM.', NULL, false),
  ('44444444-4444-4444-4444-444444444404', 'Floral colors', 'Roses in blush and ivory. Greenery: eucalyptus and ferns.', 'flowers', false)
ON CONFLICT (id) DO NOTHING;
