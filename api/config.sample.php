<?php
// Edit these for your server. Do NOT put this file in a public repo.

const DB_HOST = '127.0.0.1';
const DB_NAME = 'sakayph';
const DB_USER = 'root';        // XAMPP default. On a real server use a limited user.
const DB_PASS = '';

// Philippines time. "Today" and the hourly chart follow this.
const DB_TIMEZONE = '+08:00';

// New staff accounts need this code to sign up. Leave '' to close sign-up
// (then add staff rows yourself).
const STAFF_INVITE_CODE = 'sakay-2026';

// Any long random text. Used to hash IPs for the anti-spam limit.
const RATE_SALT = 'k7Qm2xVb9Lw4TnR8zPd3HfJc6YsA1uEg';