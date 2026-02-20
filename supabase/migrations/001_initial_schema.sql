-- Wedding Planner MVP - Initial Schema (consolidated)
-- Incorporates all changes from migrations 002-007
-- Run in Supabase SQL Editor or via supabase db push

DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

-- Vendors (002: next_payment_date; 003: removed tags, last_contacted_date, next_follow_up_date; added notes; 005: amount_paid, NUMERIC, no remaining_amount; 006: next_payment_date)
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted BOOLEAN DEFAULT false,
  category TEXT,
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  instagram TEXT,
  website TEXT,
  quoted_price NUMERIC(12,2),
  amount_paid NUMERIC(12,2),
  next_payment_date TEXT,
  status TEXT,
  notes TEXT
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted BOOLEAN DEFAULT false,
  title TEXT NOT NULL,
  description TEXT,
  assignee TEXT,
  due_date TEXT,
  priority TEXT,
  status TEXT DEFAULT 'todo'
);

-- Activities (002: removed status, category; 007: removed google_maps_link)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted BOOLEAN DEFAULT false,
  title TEXT NOT NULL,
  date TEXT,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  notes TEXT
);

-- Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted BOOLEAN DEFAULT false,
  title TEXT NOT NULL,
  body TEXT,
  tags TEXT
);
