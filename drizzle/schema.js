import { relations } from 'drizzle-orm';
import { float, int, mysqlTable, serial, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const visitorsInfo = mysqlTable('visitors', {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  aadhar_id: varchar({ length: 15 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  age: int().notNull(),
  gender: varchar({ length: 10 }).notNull(),
  phone: varchar({ length: 11 }).notNull(),
  address: varchar({ length: 255 }).notNull(),
  city: varchar({ length: 255 }).notNull(),
  pin: varchar({ length: 7 }).notNull(),
  interests: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const zones = mysqlTable('zones', {
  id: varchar("zone_id",{ length: 2 }).primaryKey(),
  name: varchar("zone_name",{ length: 255 }).notNull().unique(),
  area: float("area").notNull(),
  climate: varchar("climate",{ length: 30 }).notNull(),
  cameraTraps: int("camera_traps").notNull(),
  accessLevel: varchar("access_level",{ length: 30 }).notNull(),
  primarySpecies: varchar("primary_species",{ length: 200 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});


