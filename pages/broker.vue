<template>
  <div>
    <div class="row">
      <div
        class="col-lg-3 col-md-6"
        v-for="card in statsCards"
        :key="card.title"
      >
        <stats-card
          :title="card.title"
          :sub-title="card.subTitle"
          :type="card.type"
          :icon="card.icon"
        >
          <div slot="footer" v-html="card.footer"></div>
        </stats-card>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">Clientes</h4>
          <div>
            <div
              class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
            >
              <el-select
                class="select-primary mb-3 pagination-select"
                v-model="pagination.perPage"
                placeholder="Per page"
              >
                <el-option
                  class="select-primary"
                  v-for="item in pagination.perPageOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>

              <base-input>
                <el-input
                  type="search"
                  class="mb-3 search-input"
                  clearable
                  prefix-icon="el-icon-search"
                  placeholder="Search records"
                  v-model="searchQuery"
                  aria-controls="datatables"
                >
                </el-input>
              </base-input>
            </div>
            <el-table :data="queriedData">
              <!--------------------------CLIENT ID------------------------------------->
              <el-table-column label="CLIENT ID" width="250">
                <template slot-scope="scope">
                  {{ scope.row.clientid }}
                </template>
              </el-table-column>

              <!--------------------------USER NAME------------------------------------->
              <el-table-column label="USERNAME" width="250">
                <template slot-scope="scope">
                  {{ scope.row.username }}
                </template>
              </el-table-column>

              <!--------------------------IP ADDRESS------------------------------------->
              <el-table-column label="IP ADDRESS" width="130">
                <template slot-scope="scope">
                  {{ scope.row.ip_address }}
                </template>
              </el-table-column>

              <!--------------------------KEEPALIVE------------------------------------->
              <el-table-column label="KEEPALIVE" width="100">
                <template slot-scope="scope">
                  {{ scope.row.keepalive }}
                </template>
              </el-table-column>

              <!--------------------------SUSCRIPCIONES------------------------------------->
              <el-table-column label="SUSCRIPCIONES" width="150">
                <template slot-scope="scope">
                  {{ scope.row.subscriptions_cnt }}
                </template>
              </el-table-column>
              
              <!--------------------------CONNECTED------------------------------------->
              <el-table-column label="ESTADO" width="170">
                <template slot-scope="scope">
                  <span v-if="scope.row.connected">
                    <i class="fa fa-circle p-r-5 verde" aria-hidden="true"></i>
                    CONECTADO
                  </span>

                  <span v-else>
                    <i class="fa fa-circle p-r-5 rojo" aria-hidden="true"></i>
                    DESCONECTADO
                  </span>
                </template>
              </el-table-column>

              <!--------------------------CREADO EL------------------------------------->
              <el-table-column label="CREADO EL" width="150">
                <template slot-scope="scope">
                  {{ formatDate(scope) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div
            slot="footer"
            class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
          >
            <div class="">
              <p class="card-category">
                Showing {{ from + 1 }} to {{ to }} of {{ total }} entries
              </p>
            </div>
            <base-pagination
              class="pagination-no-border"
              v-model="pagination.currentPage"
              :per-page="pagination.perPage"
              :total="total"
            >
            </base-pagination>
          </div>
        </card>
      </div>
    </div>
    <Json :value="tableData"></Json>
  </div>
</template>

<script>
import StatsCard from "@/components/Cards/StatsCard";

import * as moment from "moment";
moment.locale("es");

import { Table, TableColumn, Select, Option } from "element-ui";
import { BasePagination } from "@/components";
import users from "../util/mock-users";
import Fuse from "fuse.js";
import swal from "sweetalert2";

export default {
  middleware: "authenticated",
  components: {
    StatsCard,
    BasePagination,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn
  },
  data() {
    return {
      statsCards: [
        {
          title: null,
          subTitle: "System Name",
          type: "warning",
          icon: "fas fa-file-alt",
          footer: null
        },
        {
          title: null,
          subTitle: "Version",
          type: "primary",
          icon: "fab fa-buffer",
          footer: null
        },
        {
          title: null,
          subTitle: "Uptime",
          type: "info",
          icon: "fa fa-hourglass",
          footer: null
        },
        {
          title: null,
          subTitle: "System Name",
          type: "danger",
          icon: "far fa-clock",
          footer: null
        }
      ],
      pagination: {
        perPage: 5,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0
      },
      searchQuery: "",
      propsToSearch: ["clientid", "username"],
      tableColumns: [
      ],
      tableData: "",
      searchedData: [],
      fuseSearch: null
    };
  },
  /***
   * Returns a page from the searched data or the whole data. Search is performed in the watch section below
   */
  computed: {
    queriedData() {
      let result = this.tableData;
      if (this.searchedData.length > 0) {
        result = this.searchedData;
      }
      return result.slice(this.from, this.to);
    },
    to() {
      let highBound = this.from + this.pagination.perPage;
      if (this.total < highBound) {
        highBound = this.total;
      }
      return highBound;
    },
    from() {
      return this.pagination.perPage * (this.pagination.currentPage - 1);
    },
    total() {
      return this.searchedData.length > 0
        ? this.searchedData.length
        : this.tableData.length;
    }
  },
  mounted() {
    this.getBrokerInfo();
    // Fuse search initialization.
    this.fuseSearch = new Fuse(this.tableData, {
      keys: ["name", "email"],
      threshold: 0.3
    });
  },

  methods: {
    formatDate(scope) {
      return moment(scope.row.connected_at).format("DD/MM/YYYY");
    },
    async getBrokerInfo() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };
      //Broker information
      try {
        const res = await this.$axios.get("/get-broker-info", axiosHeaders);
        if (res.data.status == "success") {
          this.statsCards[0].footer = res.data.data.data[0].version;
          this.statsCards[1].footer = res.data.data.data[0].sysdescr;
          this.statsCards[2].footer = res.data.data.data[0].uptime;
          this.statsCards[3].footer = res.data.data.data[0].datetime;
          //Broker clients
          try {
            const res = await this.$axios.get(
              "/get-broker-clients",
              axiosHeaders
            );
            if (res.data.status == "success") {
              this.tableData = res.data.data.data;
            }
          } catch (error) {}
          //Actualizamos la información del broker cada 5 segundos
          setTimeout(() => {
            this.getBrokerInfo();
          }, 50000);
        }
      } catch (error) {
        this.$notify({
          type: "danger",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Error getting broker info..."
        });
        console.log(error);
        return;
      }
    }
  },
  watch: {
    /**
     * Searches through the table data by a given query.
     * NOTE: If you have a lot of data, it's recommended to do the search on the Server Side and only display the results here.
     * @param value of the query
     */
    searchQuery(value) {
      let result = this.tableData;
      if (value !== "") {
        result = this.fuseSearch.search(this.searchQuery);
      }
      this.searchedData = result;
    }    
  }
};
</script>

<style>
.card-stats .numbers .card-category {
  margin-bottom: 0 !important;
  color: white !important;
  font-size: 1.25rem !important;
}

.p-r-5 {
  padding-right: 5px;
}

.verde {
  color: green;
}

.rojo {
  color:red;
}
</style>
