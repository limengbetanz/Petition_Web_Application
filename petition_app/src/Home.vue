<template>
  <div id="home_page">
  </div>
</template>

<script>
    export default {
        mounted: function(){
            this.forwardToPetitionsPage();
        },
        methods: {
            forwardToPetitionsPage: function() {
              this.$router.push({ path: `/petitions` });
            }
        }
    }
</script>
