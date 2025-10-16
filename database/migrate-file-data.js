// Migration script to add file_data column to module_checklist table
const fs = require('fs');
const path = require('path');

// Use hardcoded values for now (you can set these as environment variables)
const supabaseUrl = 'https://yjiqgrudlbtpghopbusz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    process.exit(1);
}

async function addFileDataColumn() {
    try {
        console.log('Adding file_data column to module_checklist table...');
        
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey
            },
            body: JSON.stringify({
                sql: 'ALTER TABLE module_checklist ADD COLUMN IF NOT EXISTS file_data TEXT;'
            })
        });
        
        if (response.ok) {
            console.log('✅ Column added successfully');
        } else {
            const error = await response.text();
            console.error('Failed to add column:', error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

addFileDataColumn();
