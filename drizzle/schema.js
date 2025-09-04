import { relations } from 'drizzle-orm';
import { int, mysqlTable, serial, timestamp, varchar } from 'drizzle-orm/mysql-core';

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


