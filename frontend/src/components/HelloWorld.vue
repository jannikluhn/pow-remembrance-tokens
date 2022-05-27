<script>
import { contract } from "../contract.js";

export default {
  name: "HelloWorld",

  data() {
    return {
      tokens: [],
    };
  },

  created() {
    this.fetchTokens();
  },

  methods: {
    async fetchTokens() {
      const numTokens = await contract.totalSupply();
      const numKnownTokens = this.tokens.length;
      for (let i = numKnownTokens; i < numTokens; i++) {
        const tokenID = await contract.tokenByIndex(i);
        const [owner, pow, validated] = await Promise.all([
          contract.ownerOf(tokenID),
          contract.pows(tokenID),
          contract.validated(tokenID),
        ]);
        this.tokens[i] = {
          index: i,
          id: tokenID,
          owner: owner,
          pow: pow,
          validated: validated

        };
      }
    },

    shorten(s) {
      return s.slice(0, 4) + "..." + s.slice(-4);
    },
  },
};
</script>

<template>
<div>
  <h1>PoW Remembrance tokens</h1>

  <div>
    <table>
      <tr>
        <th>Token ID</th>
        <th>Owner</th>
        <th>Validated</th>
      </tr>
      <tr v-for="token in tokens" :key="token.id">
        <td>{{ shorten(token.id.toString()) }}</td>
        <td>{{ token.owner }}</td>
        <td>{{ token.validated }}</td>
      </tr>
    </table>
  </div>
  </div>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
