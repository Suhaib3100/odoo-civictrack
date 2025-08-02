-- CivicTrack Database Initialization Script
-- This script sets up the initial database structure and data

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE civictrack'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'civictrack');

-- Connect to civictrack database
\c civictrack;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enum types
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'MODERATOR');
CREATE TYPE issue_status AS ENUM ('REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE issue_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE vote_type AS ENUM ('UPVOTE', 'DOWNVOTE');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role user_role DEFAULT 'USER',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    status issue_status DEFAULT 'REPORTED',
    priority issue_priority DEFAULT 'MEDIUM',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT false,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    images TEXT[], -- Array of image URLs
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, issue_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_location ON issues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);
CREATE INDEX IF NOT EXISTS idx_votes_issue_id ON votes(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);

-- Create spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_issues_location_gist ON issues USING GIST(ST_Point(longitude, latitude));

-- Insert default admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified)
VALUES ('admin@admin.com', '$2b$10$rQZ8kHWfQYOKV.Q8ZQZ8kOQZ8kHWfQYOKV.Q8ZQZ8kOQZ8kHWfQYO', 'Admin', 'User', 'ADMIN', true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample issues for testing
INSERT INTO issues (title, description, category, priority, address, city, state, zip_code, latitude, longitude, tags, is_anonymous)
VALUES 
    ('Pothole on Main Street', 'Large pothole causing damage to vehicles near the intersection of Main St and Oak Ave', 'Roads', 'HIGH', '123 Main Street', 'Ahmedabad', 'Gujarat', '380001', 23.0225, 72.5714, ARRAY['pothole', 'road-damage'], false),
    ('Broken Streetlight', 'Streetlight has been out for 2 weeks, making the area unsafe at night', 'Lighting', 'MEDIUM', '456 Park Avenue', 'Ahmedabad', 'Gujarat', '380002', 23.0300, 72.5800, ARRAY['streetlight', 'safety'], true),
    ('Garbage Collection Issue', 'Garbage has not been collected for over a week in our neighborhood', 'Sanitation', 'HIGH', '789 Residential Area', 'Ahmedabad', 'Gujarat', '380003', 23.0400, 72.5900, ARRAY['garbage', 'sanitation'], false)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
