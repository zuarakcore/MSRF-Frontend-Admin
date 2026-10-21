import { authApi, coachesApi } from '../../api/endpoints';
import { useApiAction } from '../../api/hooks';
import { Coach } from '../../types';

/**
 * Email a coach a link to set a new password. Before the coach has accepted the invite the
 * invite is re-sent; afterwards the normal forgot-password email is used. Both links open
 * /set-password in this app.
 */
export function useCoachPasswordReset() {
  const { run, pending } = useApiAction();

  const sendLink = (coach: Coach) =>
    coach.inviteStatus === 'Accepted'
      ? run(() => authApi.forgotPassword(coach.email), {
          success: { title: 'Password Reset Link Sent', message: `A link to set a new password was emailed to ${coach.email}.` },
          errorTitle: 'Could not send reset link',
        })
      : run(() => coachesApi.resendInvite(coach.id), {
          success: { title: 'Invite Sent Again', message: `A new set-password link was emailed to ${coach.email}.` },
          errorTitle: 'Could not resend invite',
          invalidate: [['coaches']],
        });

  const actionLabel = (coach: Coach) =>
    coach.inviteStatus === 'Accepted' ? 'Email Password Reset Link' : 'Resend Invite Link';

  return { sendLink, pending, actionLabel };
}
