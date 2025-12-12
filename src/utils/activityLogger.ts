import { supabase } from '../services/supabase';

export const logActivity = async (
    action: string,
    entityType?: string,
    entityId?: string,
    details?: any
) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        await supabase.from('activity_logs').insert({
            user_id: user?.id,
            user_email: user?.email,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};
