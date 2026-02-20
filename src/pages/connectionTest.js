import { supabaseClient } from '../config/supabase.js';

function setResult(message, type = 'secondary') {
  const resultEl = document.getElementById('result');
  if (!resultEl) return;

  resultEl.className = `alert alert-${type} mb-0`;
  resultEl.textContent = message;
}

async function testSupabaseConnection() {
  try {
    const sessionResponse = await supabaseClient.auth.getSession();

    if (sessionResponse.error) {
      throw new Error(`Auth check failed: ${sessionResponse.error.message}`);
    }

    const { data, error } = await supabaseClient
      .from('report_templates')
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(`DB query failed: ${error.message}`);
    }

    console.log('Supabase connection OK', { session: sessionResponse.data, data });
    setResult('Connection successful: auth endpoint and DB query both passed.', 'success');
  } catch (error) {
    console.error('Supabase connection test failed', error);
    setResult(`Connection failed: ${error.message}`, 'danger');
  }
}

testSupabaseConnection();
