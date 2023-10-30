import axios from 'axios'

// cf 登录邮箱
const apiEmail = 'YOUR-CLOUDFLARE-EMAIL'
// cf 全局密钥 Global API Key https://dash.cloudflare.com/profile/api-tokens
const apiKey = 'YOUR-CLOUDFLARE-GLOBAL-API-KEY'
// 要删除记录的根域名
const domain = 'YOUR-DOMAIN'

const headers = {'X-Auth-Email': apiEmail, 'X-Auth-Key': apiKey}

axios.request({url: 'https://api.cloudflare.com/client/v4/zones', headers}).then(({data}) => {
    for (const zoneList of data.result || []) {
        if (zoneList.name === domain) {
            doBatchDelete(zoneList.id)
            break;
        }
    }
});

function doBatchDelete(zoneId) {
    axios.request({
        url: `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?per_page=5000`,
        headers
    }).then(({data}) => {
        // https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records at List DNS Records
        let errorOccurs = true
        console.log(`要删除的记录总数: ${data.result.length}`)
        for (const dnsRecord of data.result || []) {
            axios.request({
                url: `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${dnsRecord.id}`,
                method: 'DELETE',
                headers
            }).then(({data}) => {
                console.log(`删除成功: ${dnsRecord.name}`)
            }).catch(error => {
                console.error(error, error.response?.data)
                errorOccurs = true
            })
            if (errorOccurs) break
        }
    }).catch(error => {
        console.error(error, error.response?.data)
    });
}
