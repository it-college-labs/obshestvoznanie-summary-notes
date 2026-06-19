DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'articles' AND column_name = 'tags' AND data_type = 'ARRAY'
    ) THEN
        ALTER TABLE articles ALTER COLUMN tags TYPE JSONB USING to_jsonb(tags);
        ALTER TABLE articles ALTER COLUMN accent TYPE JSONB USING to_jsonb(accent);
        ALTER TABLE articles ALTER COLUMN folder_preview_images TYPE JSONB USING to_jsonb(folder_preview_images);
    END IF;
END $$;
