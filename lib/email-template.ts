export function generateIssueEmailHtml(issue: any) {
  const loc = issue.building ? `${issue.building} - Room ${issue.room || 'N/A'}` : (issue.location || 'Unknown Location');
  const desc = issue.description || issue.title || 'No description provided.';
  const roll = issue.rollNumber || 'N/A';
  
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background-color: #0078d4; color: #fff; padding: 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 24px;">New Campus Issue Reported</h2>
      </div>
      <div style="padding: 32px; color: #333;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; width: 130px;"><strong>Reported By:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-family: monospace; font-size: 14px;">${roll}</span></td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><strong>Location:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${loc}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><strong>Category:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${issue.category || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><strong>Severity:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><span style="background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 14px;">${issue.severity || 'N/A'}</span></td>
          </tr>
        </table>
        
        <h3 style="margin-top: 0; font-size: 16px; color: #666;">Description:</h3>
        <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #0078d4; border-radius: 4px; margin-bottom: 24px; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${desc}</div>

        ${issue.hasImage ? `
        <div>
          <h3 style="font-size: 16px; color: #666;">Attached Evidence:</h3>
          <img src="cid:evidence_img" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" alt="Issue Evidence" />
        </div>` : '<p style="font-size: 14px; color: #999;"><i>No image attached to this report.</i></p>'}
      </div>
    </div>
  `;
}
