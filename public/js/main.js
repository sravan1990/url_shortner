new Vue({
    el: '#app',
    data: {
        error: '',
        success: false,
        name: '',
        url: '',
        sys_url: '',
    },
    methods: {
        createPuny() {
            const body = {
                name: this.name,
                url: this.url
            };

            fetch('/api/puny', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'content-type': 'application/json'
                }
            }).then(response => {
                return response.json();
            }).then(result => {
                console.log(result)
                if (result.isJoi) {
                    this.error = result.error || result.details.map(detail => detail.message).join('. ');
                } else {
                    console.log('result', result)
                    let {sys_url} = result;
                    this.sys_url = sys_url;
                    this.success = true;
                }
            });
        }
    }
});